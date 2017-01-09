defmodule Football.MainLobbyController do
  use Football.Web, :controller

  def index(conn, %{"viewer_id" => user_id}) do
    conn
    |> Football.Authentication.assign_token(user_id)
    |> render("index.html")
  end

  def index(conn, _params) do
    conn
    |> put_status(:unauthorized)
    |> render(Football.ErrorView, "301.html")
  end
end
