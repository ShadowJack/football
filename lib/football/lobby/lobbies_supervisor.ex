defmodule Football.Lobby.LobbiesSupervisor do
  @moduledoc """
  Abstraction that supervises all game lobbies
  and provides access to them
  """

  use Supervisor
  alias Football.Lobby

  @registry_name :lobbies_registry

  @doc """
  Start supervisor
  """
  @spec start_link() :: Supervisor.on_start
  def start_link, do: Supervisor.start_link(__MODULE__, [], name: __MODULE__)

  @doc """
  Supervisor initialization callback
  """
  def init(_) do
    children = [worker(Football.Lobby, [], restart: :temporary)]

    supervise(children, strategy: :simple_one_for_one)
  end

  @doc """
  Add new game lobby with specific `name`.
  Name is required.
  """
  @spec add_lobby(String.t) :: {:ok, Lobby.t} | {:error, String.t}
  def add_lobby(""), do: {:error, "Lobby name can't be empty"}

  @lint {Credo.Check.Warning.IoInspect, false}
  def add_lobby(name) when is_binary(name) do
    new_id = UUID.uuid1(:hex)
    if exists?(new_id) do
      # Try to add lobby again if generated id is not unique
      add_lobby(name)
    else
      case Supervisor.start_child(__MODULE__, [new_id, name]) do
        {:ok, pid} -> {:ok, Lobby.get_data(pid)}
        {:error, {:already_started, _pid}} -> {:error, "Lobby process already started"}
        other -> {:error, IO.inspect(other)}
      end
    end
  end

  @doc """
  Returns lobby with this `id`
  """
  @spec get_lobby(Lobby.id) :: {:ok, Lobby.t} | {:error, String.t}
  def get_lobby(id) when is_binary(id) do
    if exists?(id) do
      {:ok, Lobby.get_data(id)}
    else
      {:error, "Lobby with this id is not found"}
    end
  end

  @doc """
  Checks if lobby with this `id` already exists
  """
  @spec exists?(Lobby.id) :: boolean
  def exists?(id) when is_binary(id) do
    case Registry.lookup(@registry_name, id) do
      [] -> false
      _ -> true
    end
  end

  @doc """
  Gets the list of all lobbies
  """
  @spec get_all_lobbies() :: [Lobby.t]
  def get_all_lobbies() do
    Supervisor.which_children(__MODULE__)
    |> Enum.map(fn {_, lobby_pid, _, _} -> 
      Lobby.get_data(lobby_pid)
    end)
  end

  @doc """
  Gets the list of lobbies filtered by `selector` function
  """
  @spec get_lobbies((Lobby.t -> boolean)) :: [Lobby.t]
  def get_lobbies(selector) do
    get_all_lobbies()
    |> Enum.filter(selector)
  end

  @doc """
  Updates lobby status
  """
  @spec update_lobby_status(Lobby.id, Lobby.status) :: {:ok, Lobby.t} | {:error, String.t}
  def update_lobby_status(id, new_status) do
    if exists?(id) do
      {:ok, Lobby.update(id, status: new_status)}
    else
      {:error, "Lobby with this id doesn't exist"}
    end
  end

  @doc """
  Removes one lobby from the lobbies list
  """
  @spec remove_lobby(Lobby.id) :: :ok | {:error, String.t}
  def remove_lobby(id) do
    if exists?(id) do
      Lobby.remove(id)
      :ok
    else
      {:error, "There is no lobby with such id"}
    end
  end

  @doc """
  Removes all lobbies
  """
  @spec remove_all() :: :ok | {:error, String.t}
  def remove_all() do
    Supervisor.which_children(__MODULE__)
    |> Task.async_stream(fn {_, lobby_pid, _, _} -> Lobby.remove(lobby_pid) end)
    |> Enum.to_list()
    :ok
  end
end
