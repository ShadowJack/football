defmodule Football.GameLobbyChannel do
  @moduledoc """
  Channel that handles communication inside a
  game lobby
  """

  use Football.Web, :channel
  alias Football.Lobby

  @doc """
  Connect to specific lobby by `lobby_id`
  """
  def join("game_lobby:" <> lobby_id, _payload, socket) do
    case Lobby.add_user(lobby_id, self()) do
      {:ok, lobby} ->
        send(self(), :after_join)
        {:ok, %{lobby: lobby}, socket}
      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_info(:after_join, socket) do
    Football.Presence.track(socket, Guardian.Phoenix.Socket.current_resource(socket), %{})
    push(socket, "presence_state", Football.Presence.list(socket))

    {:noreply, socket}
  end

  #TODO: check if it's enough to use `terminate` callback
  # if not, then I'll need some supervisor to handle
  # crashing lobby channels
  # def terminate(_reason, socket) do
  #   "game_lobby:" <> lobby_id = socket.topic
  #   case  LobbiesSupervisor.get_lobby(lobby_id) do
  #     {:ok, %Lobby{status: :full}} -> LobbiesSupervisor.update_lobby_status(lobby_id, :open)
  #     _otherwise -> :nothing
  #   end
  # end

  ##
  # WebRTC signalling infrastructure
  def handle_in("signalling:sdp", %{"peerId" => peerId, "desc" => description}, socket) do
    payload = %{
      from: Guardian.Phoenix.Socket.current_resource(socket),
      to: peerId,
      sdp: description
    }
    broadcast!(socket, "signalling:sdp", payload)
    {:noreply, socket}
  end

  def handle_in("signalling:ice", %{"peerId" => peerId, "candidate" => candidate}, socket) do
    payload = %{
      from: Guardian.Phoenix.Socket.current_resource(socket),
      to: peerId,
      iceCandidate: candidate
    }
    broadcast!(socket, "signalling:ice", payload)
    {:noreply, socket}
  end
end
