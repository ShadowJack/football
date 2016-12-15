defmodule Football.Authentication do
  @moduledoc """
  Helper functions for authentication
  """

  @doc """
  Creates a JWT token for a user_id
  and adds it into assigns
  """
  def assign_token(conn, user_id) do
    { :ok, jwt, full_claims } = Guardian.encode_and_sign(user_id, :access)
    Plug.Conn.assign(conn, :guardian_token, jwt)
  end
end
