defmodule Football.Lobby do
  @moduledoc """
  Container for Lobby struct
  """

  @enforce_keys [:id]
  defstruct [:id, :name, :created_at]

  @type id :: non_neg_integer()
  @type t :: %Football.Lobby{id: id, name: String.t, created_at: DateTime.t}
end
