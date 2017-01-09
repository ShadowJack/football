defmodule Football.UserSocket do
  use Phoenix.Socket
  use Guardian.Phoenix.Socket

  require Logger

  ## Channels
  channel "main_lobby:*", Football.MainLobbyChannel
  channel "game_lobby:*", Football.GameLobbyChannel

  ## Transports
  transport :websocket, Phoenix.Transports.WebSocket

  @doc """
  
  Authomatic authentication is performed via Guardian
  with `use Guardian.Phoenix.Socket`.

  This method is reached only by unauthenticated user
  thus it returns error.
  """ 
  def connect(_params, _socket) do
    :error
  end

  def id(socket), do: "users_socket:#{Guardian.Phoenix.Socket.current_resource(socket)}"
end
