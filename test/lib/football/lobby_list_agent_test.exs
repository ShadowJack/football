defmodule Football.LobbyListAgentTest do
  use ExUnit.Case, async: true

  import Football.Lobby.LobbiesManager
  alias Football.Lobby

  # Clean agent state before each test
  setup do
    remove_all()
    :ok
  end

  test "it adds a new lobby" do
    assert {:ok, %Lobby{id: id, name: "test_lobby"}} = add_lobby("test_lobby") 
    assert exists?("test_lobby")
    assert exists?(id)
  end

  test "it doesn't add a duplicate lobby" do
    add_lobby("test_lobby")

    assert {:error, _reason} = add_lobby("test_lobby")
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
      |> Enum.map(fn lobby -> lobby.name end)
    assert all_lobbie_names == ["test_lobby1", "test_lobby2", "test_lobby3"]
  end

  test "it removes lobby from LobbyList" do
    add_lobby("test_lobby")
    %Lobby{id: id, name: "test_lobby"} = get_all_lobbies() |> List.first()
    
    assert remove_lobby(id) == :ok

    refute exists?("test_lobby")
  end

  test "it returns error when asked to remove lobby that doesn't exist" do
    assert {:error, _reason} = remove_lobby(1111)
  end
end
