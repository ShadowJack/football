defmodule Football.LobbyListAgent do
  @moduledoc """
  Abstraction that holds all game lobbies
  available for connection
  """

  @doc """
  Start agent
  """
  @spec start_link() :: Agent.agent
  def start_link() do
    Agent.start_link(fn -> [] end, name: __MODULE__)
  end

  @doc """
  Add new game lobby with specific `name`.
  Name is required and checked for uniqueness.
  """
  @spec add_lobby(String.t) :: :ok | {:error, String.t}
  def add_lobby(""), do: {:error, "Lobby name can't be empty"}
  def add_lobby(name) do
    if exists?(name) do
      {:error, "Lobby with this name already exists"}
    else
      Agent.update(__MODULE__, fn list -> [name | list] end)
      :ok
    end
  end

  @doc """
  Checks if lobby with this name already exists
  """
  @spec exists?(String.t) :: boolean
  def exists?(name) do
    Agent.get(__MODULE__, &Enum.any?(&1, fn x -> x == name end))
  end

  @doc """
  Gets the list of all lobbies ordered starting from the first added
  """
  @spec get_all_lobbies() :: [String.t]
  def get_all_lobbies() do
    Agent.get(__MODULE__, &(&1))
    |> Enum.reverse()
  end

  @doc """
  Removes one lobby from the lobbies list
  """
  @spec remove_lobby(String.t) :: :ok | {:error, String.t}
  def remove_lobby(name) do
    if exists?(name) do
      Agent.update(__MODULE__, fn list -> List.delete(list, name) end)
    else
      {:error, "There is no lobby with such name"}
    end
  end
end
