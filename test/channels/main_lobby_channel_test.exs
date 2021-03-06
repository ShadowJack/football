defmodule Football.MainLobbyChannelTest do
  use Football.ChannelCase

  alias Football.{UserSocket, MainLobbyChannel, Lobby, Lobby.LobbiesSupervisor}

  @game_lobby_name Atom.to_string(__MODULE__)

  setup do
    {:ok, jwt, _} = Guardian.encode_and_sign("test_user", :access)
    {:ok, socket} = connect(UserSocket, %{"guardian_token" => jwt})
    {:ok, %{game_lobbies: lobbies}, authed_socket} =
      socket |> subscribe_and_join(MainLobbyChannel, "main_lobby:lobby")

    on_exit fn ->
      leave(authed_socket)
      LobbiesSupervisor.remove_all()
    end

    {:ok, socket: authed_socket, lobbies: lobbies}
  end

  test "list of lobbies is returned when user has joined channel", %{lobbies: lobbies} do
    assert is_list(lobbies)
  end

  test "adds a new lobby and updates lobbies list for all users", %{socket: socket} do
    ref = push(socket, "lobby:add", %{"name" => @game_lobby_name})

    assert_reply(ref, :ok)
    assert_broadcast("lobby:added", %Lobby{name: @game_lobby_name})
  end

  test "sends updated lobby info to all users" do
    {:ok, %Lobby{id: id}} = LobbiesSupervisor.add_lobby(@game_lobby_name)
    connect_full_game_lobby(id)

    assert_broadcast("lobby:status_updated", %{id: ^id, new_status: :full})
  end

  test "sends only open lobbies when new user connects" do
    {:ok, %Lobby{id: first_id}} = LobbiesSupervisor.add_lobby(@game_lobby_name)
    {:ok, %Lobby{id: second_id}} = LobbiesSupervisor.add_lobby(@game_lobby_name <> "2")
    connect_full_game_lobby(first_id)

    # New user connects to main lobby
    {:ok, jwt, _} = Guardian.encode_and_sign("new_test_user", :access)
    {:ok, socket} = connect(UserSocket, %{"guardian_token" => jwt})
    {:ok, %{game_lobbies: lobbies}, _} =
      socket
      |> subscribe_and_join(MainLobbyChannel, "main_lobby:lobby")

    assert [%Lobby{id: ^second_id}] = lobbies
  end

  test "sends info about removed lobby" do
    {:ok, %Lobby{id: id}} = LobbiesSupervisor.add_lobby(@game_lobby_name)

    LobbiesSupervisor.remove_lobby(id)

    assert_broadcast("lobby:removed", %{id: ^id})
  end
end
