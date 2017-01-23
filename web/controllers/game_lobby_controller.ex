defmodule Football.GameLobbyController do
  use Football.Web, :controller

  def index(conn, %{"token" => guardian_token, "lobby_id" => lobby_id}) do
    with {:ok, claims} <- Guardian.decode_and_verify(guardian_token),
         {:ok, resource} <-Guardian.serializer.from_token(claims["sub"]) do
      render(conn, "index.html", %{guardian_token: guardian_token, lobby_id: lobby_id, user_id: resource})
    else
      {:error, _reason} -> 
        conn
        |> put_status(:unauthorized)
        |> render(Football.ErrorView, "301.html")
    end
  end
end
