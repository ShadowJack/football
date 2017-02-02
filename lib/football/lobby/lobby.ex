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

  @registry_name :lobbies_registry

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

  ##
  # GenServer callbacks
  #

  @doc false
  def init([id, name]) do
    {:ok, %__MODULE__{id: id, name: name, created_at: DateTime.utc_now(), status: :open}}
  end

  @doc false
  def handle_call(:get_data, _from, state) do
    {:reply , state, state}
  end

  @doc false
  def handle_call({:update, changes}, _from, state) do
    new_state = struct(state, changes)
    Football.MainLobbyChannel.handle_lobby_status_update(new_state)
    {:reply, new_state, new_state}
  end

  @doc false
  def handle_cast(:remove, state) do
    {:stop, :normal, state}
  end

  @doc false
  def terminate(_reason, state) do
    Football.MainLobbyChannel.handle_lobby_removed(state.id)
    :ok
  end
end
