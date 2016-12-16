defmodule Football.MainLobbyChannel do
  use Football.Web, :channel

  def join("main_lobby:lobby", _payload, socket) do
    resp = %{game_lobbies: Football.LobbyListAgent.get_all_lobbies()}
    {:ok, resp, socket}
  end
end
