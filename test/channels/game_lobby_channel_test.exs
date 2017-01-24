defmodule Football.GameLobbyChannelTest do
  use Football.ChannelCase

  alias Football.{GameLobbyChannel, Lobby.LobbiesSupervisor}

  @lobby_name Atom.to_string(__MODULE__)

  setup do
    {:ok, lobby} = LobbiesSupervisor.add_lobby(@lobby_name)

    {:ok, jwt, _} = Guardian.encode_and_sign("game_channel_test_user", :access)
    {:ok, socket} = connect(Football.UserSocket, %{"guardian_token" => jwt})

    on_exit(fn -> 
      LobbiesSupervisor.remove_lobby(lobby.id)
      Guardian.Phoenix.Socket.sign_out(socket)
    end)

    {:ok, socket: socket, lobby: lobby}
  end

  test "current lobby is returned on user connection", %{socket: socket, lobby: lobby} do
    assert {:ok, %{lobby: ^lobby}, _socket} = 
      socket
      |> subscribe_and_join(GameLobbyChannel, "game_lobby:#{lobby.id}")
  end

  test "presence state is pushed after user connection", %{socket: socket, lobby: lobby} do
    {:ok, _resp, socket} = subscribe_and_join(socket, GameLobbyChannel, "game_lobby:#{lobby.id}")
    
    user_name = Guardian.Phoenix.Socket.current_resource(socket)
    assert_push("presence_state", %{^user_name => %{metas: [_some_map]}})
  end

end
