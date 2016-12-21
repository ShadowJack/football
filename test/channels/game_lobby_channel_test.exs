defmodule Football.GameLobbyChannelTest do
  use Football.ChannelCase

  alias Football.{GameLobbyChannel, Lobby.LobbiesManager}

  setup do
    {:ok, lobby} = Football.Lobby.LobbiesManager.add_lobby("Test lobby")

    on_exit(fn -> LobbiesManager.remove_all() end)

    {:ok, lobby: lobby}
  end

  test "current lobby is returned on user connection", %{lobby: lobby} do
  # TODO: move sign in to setup and don't forget to sign out(and in another test too)
    {:ok, token, _} = Guardian.encode_and_sign("")

    assert {:ok, %{lobby: ^lobby}, socket} =
      socket("socket", %{guardian_token: token})
      |> subscribe_and_join(GameLobbyChannel, "game_lobby:#{lobby.id}")
  end

  test "presence state is pushed after user connection", %{lobby: lobby} do
    {:ok, token, _} = Guardian.encode_and_sign("test_user")
    {:ok, _resp, socket} =
      socket("socket", %{guardian_token: token})
      |> subscribe_and_join(GameLobbyChannel, "game_lobby:#{lobby.id}")

    assert_push("presence_state", %{"" => %{metas: [_some_map]}})
  end

end
