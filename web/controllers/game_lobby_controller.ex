defmodule Football.GameLobbyController do
  use Football.Web, :controller

  def index(conn, %{"token" => guardian_token, "lobby_id" => lobby_id}) do
    render(conn, "index.html", %{guardian_token: guardian_token, lobby_id: lobby_id})
  end
  
end