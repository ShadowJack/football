defmodule Football.PageControllerTest do
  use Football.ConnCase

  test "GET /", %{conn: conn} do
    conn = get(conn, "/?viewer_id=123456")
    assert html_response(conn, 200) =~ "Main lobby"
  end

  test "returs error code 401 when user id is not provided in parameters", %{conn: conn} do
    conn = get(conn, "/")
    assert html_response(conn, 401) =~ "You are unauthorized"
  end
end
