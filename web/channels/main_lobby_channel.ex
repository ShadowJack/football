defmodule Football.MainLobbyChannel do
  use Football.Web, :channel

  alias Football.LobbyListAgent

  def join("main_lobby:lobby", _payload, socket) do
    resp = %{game_lobbies: Football.LobbyListAgent.get_all_lobbies()}
    {:ok, resp, socket}
  end

  def handle_in("lobby:add", %{"name" => name}, socket) do
    case LobbyListAgent.add_lobby(name) do
      :ok -> 
        broadcast!(socket, "lobby:added", %{"name" => name})
        {:reply, :ok, socket}
      {:error, reason} ->
        {:reply, {:error, %{"reason" => reason}}, socket}
    end
  end
end
