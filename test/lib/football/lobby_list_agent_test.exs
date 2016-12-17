defmodule Football.LobbyListAgentTest do
  use ExUnit.Case, async: true

  import Football.LobbyListAgent

  # Clean agent state before each test
  setup do
    Agent.update(Football.LobbyListAgent, fn _list -> [] end)
    :ok
  end

  test "it adds a new lobby" do
    assert add_lobby("test_lobby") == :ok
    assert exists?("test_lobby")
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
    
    assert get_all_lobbies() == ["test_lobby1", "test_lobby2", "test_lobby3"]
  end

  test "it removes lobby from LobbyList" do
    add_lobby("test_lobby")
    
    assert remove_lobby("test_lobby") == :ok

    refute exists?("test_lobby")
  end

  test "it returns error when asked to remove lobby that doesn't exist" do
    assert {:error, _reason} = remove_lobby("test_lobby")
  end
end
