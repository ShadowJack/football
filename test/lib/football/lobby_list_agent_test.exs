defmodule Football.LobbyListAgentTest do
  use ExUnit.Case, async: true

  import Football.Lobby.LobbiesSupervisor
  alias Football.Lobby

  # Clean agent state before each test
  setup do
    remove_all()
    :ok
  end

  test "it adds a new lobby" do
    assert {:ok, %Lobby{id: id, name: "test_lobby", status: :open}} = add_lobby("test_lobby") 
    assert exists?(id)
  end

  test "it doesn't add a lobby with empty name" do
    assert {:error, _reason} = add_lobby("")
  end

  test "it lists all lobbies" do
    add_lobby("test_lobby1")
    add_lobby("test_lobby2")
    add_lobby("test_lobby3")
    
    all_lobbie_names = 
      get_all_lobbies() 
      |> Enum.sort(fn l1, l2 -> 
        l1.created_at <= l2.created_at
      end)
      |> Enum.map(fn lobby -> lobby.name end)
    assert all_lobbie_names == ["test_lobby1", "test_lobby2", "test_lobby3"]
  end

  test "it's possible to fetch lobbies by selector" do
    add_lobby("test_lobby1")
    add_lobby("test_lobby2")
  
    lobbie_names =
      get_lobbies(fn lobby -> lobby.status == :open end)
      |> Enum.sort(fn l1, l2 -> 
        l1.created_at <= l2.created_at
      end)
      |> Enum.map(fn lobby -> lobby.name end)
    assert lobbie_names == ["test_lobby1", "test_lobby2"]
  end

  test "it removes lobby from LobbyList" do
    add_lobby("test_lobby")
    %Lobby{id: id, name: "test_lobby", status: _} = get_all_lobbies() |> List.first()

    [{pid, _value} | _] = Registry.lookup(:lobbies_registry, id)
    ref = Process.monitor(pid)

    assert remove_lobby(id) == :ok
    assert_receive({:DOWN, ^ref, :process, _, :normal}, 1000)
  end

  test "it returns error when asked to remove lobby that doesn't exist" do
    assert {:error, _reason} = remove_lobby("1111")
  end

  test "it returns a lobby by id" do
    {:ok, lobby} = add_lobby("test_lobby")

    assert {:ok, lobby} = get_lobby(lobby.id)
    assert lobby.name == "test_lobby"
  end
end
