defmodule Football.Router do
  use Football.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers, %{"x-frame-options" => "ALLOW-FROM https://vk.com/"}
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Football do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", Football do
  #   pipe_through :api
  # end
end
