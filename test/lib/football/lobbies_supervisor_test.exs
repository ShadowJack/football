defmodule Football.LobbiesSupervisorTest do
  use ExUnit.Case, async: true

  import Football.Lobby.LobbiesSupervisor
  alias Football.Lobby

  setup_all do
    on_exit(fn -> remove_all() end)
  end

  test "it adds a new lobby", context do
    test_name = test_name(context)
    assert {:ok, %Lobby{id: id, name: ^test_name, status: :open}} = add_lobby(test_name) 
    assert exists?(id)
  end

  test "it doesn't add a lobby with empty name" do
    assert {:error, _reason} = add_lobby("")
  end

  test "it's possible to fetch lobbies by selector", context do
    test_name = test_name(context)
    lobby_names = 
      for i <- 1..2 do
        "#{test_name}#{i}"
      end
    lobby_names |> Enum.map(fn l -> add_lobby(l) end)
  
    assert lobby_names == 
      get_lobbies(fn lobby -> lobby.name |> String.contains?(test_name) end)
      |> Enum.sort(fn l1, l2 -> l1.created_at <= l2.created_at end)
      |> Enum.map(fn lobby -> lobby.name end)
  end

  test "it removes lobby from LobbyList", context do
    {:ok, %Lobby{id: id}} = add_lobby(test_name(context))

    [{pid, _value} | _] = Registry.lookup(:lobbies_registry, id)
    ref = Process.monitor(pid)

    assert remove_lobby(id) == :ok
    assert_receive({:DOWN, ^ref, :process, _, :normal}, 1000)
  end

  test "it returns error when asked to remove lobby that doesn't exist", context do
    assert {:error, _reason} = remove_lobby(test_name(context))
  end

  test "it returns a lobby by id", context do
    test_name = test_name(context)
    {:ok, lobby} = add_lobby(test_name)

    assert {:ok, %Lobby{name: ^test_name}} = get_lobby(lobby.id)
  end

  defp test_name(%{test: test_name}) do
    Atom.to_string(test_name)
  end
end
