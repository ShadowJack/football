defmodule Football.MainLobbyChannelTest do
  use Football.ChannelCase

  alias Football.{UserSocket, MainLobbyChannel}

  @game_lobby_name Atom.to_string(__MODULE__)

  setup do
    {:ok, jwt, _} = Guardian.encode_and_sign("test_user", :access)
    {:ok, socket} = connect(UserSocket, %{"guardian_token" => jwt})
    {:ok, %{game_lobbies: lobbies}, authed_socket} =
      socket
      |> subscribe_and_join(MainLobbyChannel, "main_lobby:lobby")

    on_exit fn -> 
      Guardian.Phoenix.Socket.sign_out(authed_socket)
    end

    {:ok, socket: authed_socket, lobbies: lobbies}
  end

  test "list of lobbies is returned when user has joined channel", %{lobbies: lobbies} do
    assert is_list(lobbies)
  end

  test "adds a new lobby and updates lobbies list for all users", %{socket: socket} do
    ref = push(socket, "lobby:add", %{"name" => @game_lobby_name})
    assert_reply(ref, :ok)
    assert_broadcast("lobby:added", %{"id" => _id, "name" => @game_lobby_name, "created_at" => _created_at})
  end
end
