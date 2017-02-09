defmodule Football.Lobby do
  @moduledoc """
  Game lobby GenServer 
  that holds basic info about lobby
  """

  @enforce_keys [:id]
  defstruct [:id, :name, :created_at, :status]

  @type id :: String.t
  @type status :: :open | :full | :in_game | :finished
  @type t :: %__MODULE__{id: id, name: String.t, created_at: DateTime.t, status: status}

  @registry_name Application.get_env(:football, :lobbies_registry_name, :lobbies_registry)
  @users_limit 8
  @status_values [:open, :full, :in_game, :finished]

  ##
  # Client interface
  #

  @doc """
  Start a new lobby
  """
  @spec start_link(id, String.t) :: GenServer.on_start
  def start_link(id, name) do
    GenServer.start_link(__MODULE__, [id, name], name: via_tuple(id))
  end

  @spec via_tuple(id) :: tuple
  defp via_tuple(id) do
    {:via, Registry, {@registry_name, id}}
  end

  @doc """
  Get internal lobby data structure by `pid`
  """
  @spec get_data(pid) :: t
  def get_data(pid) when is_pid(pid) do
    GenServer.call(pid, :get_data)
  end

  @doc """
  Get internal lobby data structure by lobby `id`
  """
  @spec get_data(id) :: t
  def get_data(id) do
    GenServer.call(via_tuple(id), :get_data)
  end

  @doc """
  Adds a new user channel for monitoring
  """
  @spec add_user(id, pid) :: {:ok, Lobby.t} | {:error, String.t}
  def add_user(id, pid) do
    GenServer.call(via_tuple(id), {:add_user, pid})
  end

  @doc """
  Update lobby by `id`
  """
  @spec update(Lobby.id, Enum.t) :: Lobby.t
  def update(id, changes) do
    GenServer.call(via_tuple(id), {:update, changes})
  end

  @doc """
  Remove the lobby by `pid`
  """
  @spec remove(GenServer.server) :: none
  def remove(pid) when is_pid(pid) do
    GenServer.cast(pid, :remove)
  end

  @doc """
  Remove the lobby by `id`
  """
  @spec remove(id) :: none
  def remove(id) do
    GenServer.cast(via_tuple(id), :remove)
  end

  @doc """
  Get maximum number of connected users
  """
  @spec users_limit() :: number
  def users_limit(), do: @users_limit

  @doc """
  Get possible values for status
  """
  @spec status_values() :: [status]
  def status_values(), do: @status_values

  ##
  # GenServer callbacks
  #

  @doc false
  def init([id, name]) do
    lobby = %__MODULE__{id: id, name: name, created_at: DateTime.utc_now(), status: :open}
    {:ok, {lobby, []}}
  end

  # Handle addition of new users
  @doc false
  def handle_call({:add_user, pid}, _from, {%__MODULE__{status: :open} = lobby, users}) do
    ref = Process.monitor(pid)
    users = [ref | users]

    if limit_is_reached(users) do
      updated_lobby = %__MODULE__{lobby | status: :full}
      Football.MainLobbyChannel.handle_lobby_status_update(updated_lobby)
      {:reply, {:ok, updated_lobby}, {updated_lobby, users}}
    else
      {:reply, {:ok, lobby}, {lobby, users}}
    end
  end

  @doc false
  def handle_call({:add_user, _pid}, _from, state) do
    resp = {:error, "Can't add a new user, lobby is not open"}
    {:reply, resp, state}
  end

  @doc false
  def handle_call(:get_data, _from, {lobby, _users} = state) do
    {:reply , lobby, state}
  end

  # Handle DOWN events from user channels
  @doc false
  def handle_info({:DOWN, ref, _, _, _}, {lobby, users}) do
    users = users |> Enum.filter(fn user_ref -> user_ref != ref end)
    if lobby.status == :full && !limit_is_reached(users) do
      updated_lobby = %__MODULE__{lobby | status: :open}
      Football.MainLobbyChannel.handle_lobby_status_update(updated_lobby)
      {:noreply, {updated_lobby, users}}
    else
      {:noreply, {lobby, users}}
    end
  end


  @doc false
  def handle_cast(:remove, state) do
    {:stop, :normal, state}
  end

  @doc false
  def terminate(_reason, {lobby, _users}) do
    Football.MainLobbyChannel.handle_lobby_removed(lobby.id)
    :ok
  end

  defp limit_is_reached(users) do
    users |> Enum.count >= @users_limit   
  end
end
