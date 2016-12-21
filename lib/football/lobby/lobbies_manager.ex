defmodule Football.Lobby.LobbiesManager do
  @moduledoc """
  Abstraction that holds all game lobbies
  available for connection
  """

  alias Football.Lobby

  @initial_state {[], 1}

  @doc """
  Start agent
  """
  @spec start_link() :: Agent.agent
  def start_link() do
    Agent.start_link(fn -> @initial_state end, name: __MODULE__)
  end

  @doc """
  Add new game lobby with specific `name`.
  Name is required and checked for uniqueness.
  """
  @spec add_lobby(String.t) :: {:ok, Lobby.t} | {:error, String.t}
  def add_lobby(""), do: {:error, "Lobby name can't be empty"}

  def add_lobby(name) do
    if exists?(name) do
      {:error, "Lobby with this name already exists"}
    else
      lobby = Agent.get_and_update(__MODULE__, fn {list, current_id} -> 
        new_lobby = %Lobby{id: current_id, name: name, created_at: DateTime.utc_now()}
        {new_lobby, {[new_lobby | list], current_id + 1}}
      end)
      {:ok, lobby}
    end
  end

  @doc """
  Returns lobby with this `id`
  """
  @spec get_lobby(String.t) :: {:ok, Lobby.t} | {:error, String.t}
  def get_lobby(id) when is_binary(id) do
    id
    |> String.to_integer()
    |> get_lobby()
  end

  @spec get_lobby(Lobby.id) :: {:ok, Lobby.t} | {:error, String.t}
  def get_lobby(id) do
    lobby = Agent.get(__MODULE__, fn {list, _cur_id} -> 
      Enum.find(list, fn x -> x.id == id end) 
    end)
    if lobby != nil do
      {:ok, lobby}
    else
      {:error, "Lobby with this id is not found"}
    end
  end

  @doc """
  Checks if lobby with this `id` already exists
  """
  @spec exists?(Lobby.id) :: boolean
  def exists?(id) when is_number(id) do
    Agent.get(__MODULE__, fn {list, _cur_id} -> 
      Enum.any?(list, fn x -> x.id == id end) 
    end)
  end

  @doc """
  Checks if lobby with this `name` already exists
  """
  @spec exists?(String.t) :: boolean
  def exists?(name) do
    Agent.get(__MODULE__, fn {list, _cur_id} ->
      Enum.any?(list, fn x -> x.name == name end)
    end)
  end

  @doc """
  Gets the list of all lobbies beginning with the first added
  """
  @spec get_all_lobbies() :: [Lobby.t]
  def get_all_lobbies() do
    Agent.get(__MODULE__, &(&1))
    |> elem(0)
    |> Enum.reverse()
  end

  @doc """
  Removes one lobby from the lobbies list
  """
  @spec remove_lobby(Lobby.id) :: :ok | {:error, String.t}
  def remove_lobby(id) do
    Agent.get_and_update(__MODULE__, fn {list, curr_id} = state ->
      index = Enum.find_index(list, fn x -> x.id == id end)
      case index do
        nil -> 
          {{:error, "There is no lobby with such name"}, state}
        idx -> 
        {:ok, {List.delete_at(list, idx), curr_id}}
      end
    end)
  end

  @doc """
  Removes all lobbies
  """
  @spec remove_all() :: :ok | {:error, String.t}
  def remove_all() do
    Agent.update(__MODULE__, fn _list -> @initial_state end)
    :ok
  end
end
