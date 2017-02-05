defmodule Football.Presence do
  use Phoenix.Presence, otp_app: :football,
                        pubsub_server: Football.PubSub
end
