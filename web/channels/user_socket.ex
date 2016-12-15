defmodule Football.UserSocket do
  use Phoenix.Socket
  use Guardian.Phoenix.Socket

  ## Channels
  channel "main_lobby:*", Football.MainLobbyChannel

  ## Transports
  transport :websocket, Phoenix.Transports.WebSocket

  @doc """
  Each time user connects to the socket it must be
  authenticated, so automatic authentication is enabled
  via Guardian.Phoenix.Socket.

  This method is reached only by unauthenticated user
  thus it returns error
  """ 
  def connect(_params, _socket) do
    :error
  end

  def id(socket), do: "users_socket:#{Guardian.Phoenix.Socket.current_resource(socket)}"
end
