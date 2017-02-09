defmodule Football.ChannelCase do
  @moduledoc """
  This module defines the test case to be used by
  channel tests.

  Such tests rely on `Phoenix.ChannelTest` and also
  import other functionality to make it easier
  to build and query models.

  Finally, if the test case interacts with the database,
  it cannot be async. For this reason, every test runs
  inside a transaction which is reset at the beginning
  of the test unless the test case is marked as async.
  """

  use ExUnit.CaseTemplate

  # These require and module tag
  # are used for helper functions
  require Phoenix.ChannelTest
  @endpoint Football.Endpoint

  using do
    quote do
      # Import conveniences for testing with channels
      use Phoenix.ChannelTest

      alias Football.Repo
      import Ecto
      import Ecto.Changeset
      import Ecto.Query
      import Football.ChannelCase

      # The default endpoint for testing
      @endpoint Football.Endpoint
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Football.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Football.Repo, {:shared, self()})
    end

    :ok
  end

  @doc """
  Connects max amount of users to the specified game lobby
  and returns a list of connected sockets
  """
  @spec connect_full_game_lobby(Football.Lobby.id) :: [Phoenix.Socket.t]
  def connect_full_game_lobby(lobby_id) do
    for user_id <- 1..Football.Lobby.users_limit() do
      connect_to_game_lobby(user_id, lobby_id)
    end
  end

  @doc """
  Connects one user with `user_id` to game lobby specified by `lobby_id`.
  Returns authorized and connected socket.
  """
  @spec connect_to_game_lobby(number, Football.Lobby.id) :: Phoenix.Socket.t
  def connect_to_game_lobby(user_id, lobby_id) do
    socket = connect_to_socket(user_id)
    {:ok, _resp, socket} = Phoenix.ChannelTest.subscribe_and_join(socket, Football.GameLobbyChannel, "game_lobby:#{lobby_id}")
    socket
  end

  @doc """
  Connects a user with `user_id` to socket
  """
  @spec connect_to_socket(number) :: Phoenix.Socket.t
  def connect_to_socket(user_id) do
    {:ok, jwt, _} = Guardian.encode_and_sign("test_user:#{user_id}", :access)
    {:ok, socket} = Phoenix.ChannelTest.connect(Football.UserSocket, %{"guardian_token" => jwt})
    socket
  end
end
