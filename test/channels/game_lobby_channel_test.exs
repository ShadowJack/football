defmodule Football.GameLobbyChannelTest do
  use Football.ChannelCase

  alias Football.{GameLobbyChannel, Lobby, Lobby.LobbiesSupervisor}

  @lobby_name Atom.to_string(__MODULE__)
  @user_id 777

  setup do
    {:ok, lobby} = LobbiesSupervisor.add_lobby(@lobby_name)

    socket = connect_to_socket(@user_id)

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

  test "changes lobby status to :full when lobby is full", %{lobby: %Lobby{id: id}} do
    @endpoint.subscribe("main_lobby:lobby")
    connect_full_lobby(id)

    assert_broadcast("lobby:status_updated", %{id: ^id, new_status: :full})
  end

  test "changes lobby status to :open when someone leaves full lobby", %{lobby: %Lobby{id: id}} do 
    @endpoint.subscribe("main_lobby:lobby")
    first_socket = 
      connect_full_lobby(id)
      |> List.first()

    Process.unlink(first_socket.channel_pid)
    ref = leave(first_socket)

    assert_reply(ref, :ok)
    assert_broadcast("lobby:status_updated", %{id: ^id, new_status: :open})
  end

  test "it's impossible to connect to full lobby" do
    {:ok, lobby} = LobbiesSupervisor.add_lobby("full_lobby")
    LobbiesSupervisor.update_lobby_status(lobby.id, :full)
    
    socket = connect_to_socket(1)
    assert {:error, %{reason: _}} = subscribe_and_join(socket, GameLobbyChannel, "game_lobby:#{lobby.id}")
  end


  ##
  # Helper functions

  @doc false
  defp connect_full_lobby(lobby_id) do
    # Connect max amount of users
    for user_id <- 1..Lobby.users_limit() do
      connect_to_lobby(user_id, lobby_id)
    end
  end

  @doc false
  defp connect_to_lobby(user_id, lobby_id) do
    socket = connect_to_socket(user_id)
    {:ok, _resp, socket} = subscribe_and_join(socket, GameLobbyChannel, "game_lobby:#{lobby_id}")
    socket
  end

  @doc false
  defp connect_to_socket(user_id) do
    {:ok, jwt, _} = Guardian.encode_and_sign("game_channel_test_user:#{user_id}", :access)
    {:ok, socket} = connect(Football.UserSocket, %{"guardian_token" => jwt})
    socket
  end
end
