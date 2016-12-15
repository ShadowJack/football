defmodule Football.GuardianSerializer do
  @behaviour Guardian.Serializer

  def for_token(user_id) when is_binary(user_id), do: { :ok, "User:#{user_id}" }
  def for_token(_), do: { :error, "Unknown resource type" }

  def from_token("User:" <> id), do: { :ok, id }
  def from_token(_), do: { :error, "Unknown resource type" }
end
