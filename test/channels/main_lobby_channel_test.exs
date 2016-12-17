defmodule Football.MainLobbyChannelTest do
  use Football.ChannelCase

  alias Football.MainLobbyChannel

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
    push(socket, "lobby:add", %{"name" => "new_lobby" })
    assert_broadcast("lobby:added", %{"name" => "new_lobby"})
    assert Football.LobbyListAgent.exists?("new_lobby")
  end
end
