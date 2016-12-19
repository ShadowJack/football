defmodule Football.MainLobbyChannelTest do
  use Football.ChannelCase

  alias Football.{MainLobbyChannel, Lobby, Lobby.LobbiesManager}

  setup do
    {:ok, jwt, _} = Guardian.encode_and_sign("test_user")
    {:ok, %{game_lobbies: lobbies}, socket} =
      socket("socket", %{guardian_token: jwt})
      |> subscribe_and_join(MainLobbyChannel, "main_lobby:lobby")

    {:ok, socket: socket, lobbies: lobbies}
  end

  test "list of lobbies is returned when user has joined channel", %{lobbies: lobbies} do
    assert is_list(lobbies)
  end

  test "adds a new lobby and updates lobbies list for all users", %{socket: socket} do
    ref = push(socket, "lobby:add", %{"name" => "new_lobby"})
    assert_reply(ref, :ok)
    assert %Lobby{id: id, name: "new_lobby", created_at: created_at} = LobbiesManager.get_all_lobbies() |> List.first()
    assert_broadcast("lobby:added", %{"id" => ^id, "name" => "new_lobby", "created_at" => ^created_at})
  end
end
