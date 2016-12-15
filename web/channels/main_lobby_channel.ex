defmodule Football.MainLobbyChannel do
  use Football.Web, :channel

  def join("main_lobby:lobby", _payload, socket) do
    resp = %{game_lobbies: ["lobby1", "lobby2", "lobby3"]}
    {:ok, resp, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (main_lobby:lobby).
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end
end
