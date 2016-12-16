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

  # test "ping replies with status ok", %{socket: socket} do
  #   ref = push socket, "ping", %{"hello" => "there"}
  #   assert_reply ref, :ok, %{"hello" => "there"}
  # end
  # 
  # test "shout broadcasts to main_lobby:lobby", %{socket: socket} do
  #   push socket, "shout", %{"hello" => "all"}
  #   assert_broadcast "shout", %{"hello" => "all"}
  # end
  # 
  # test "broadcasts are pushed to the client", %{socket: socket} do
  #   broadcast_from! socket, "broadcast", %{"some" => "data"}
  #   assert_push "broadcast", %{"some" => "data"}
  # end
end
