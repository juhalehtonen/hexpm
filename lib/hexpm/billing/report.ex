defmodule Hexpm.Billing.Report do
  use GenServer
  import Ecto.Query, only: [from: 2]
  alias Hexpm.Repo
  alias Hexpm.Accounts.Organization

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, opts)
  end

  def init(opts) do
    Process.send_after(self(), :update, opts[:interval])
    {:ok, opts}
  end

  def handle_info(:update, opts) do
    report = report()
    organizations = organizations()

    set_active(organizations, report)
    set_inactive(organizations, report)

    Process.send_after(self(), :update, opts[:interval])
    {:noreply, opts}
  end

  defp report() do
    Hexpm.Billing.report()
    |> MapSet.new()
  end

  defp organizations() do
    from(r in Organization, select: {r.name, r.billing_active})
    |> Repo.all()
  end

  defp set_active(organizations, report) do
    to_update =
      Enum.flat_map(organizations, fn {name, active} ->
        if not active and name in report do
          [name]
        else
          []
        end
      end)

    if to_update != [] do
      from(r in Organization, where: r.name in ^to_update)
      |> Repo.update_all(set: [billing_active: true])
    end
  end

  defp set_inactive(organizations, report) do
    to_update =
      Enum.flat_map(organizations, fn {name, active} ->
        if active and name not in report do
          [name]
        else
          []
        end
      end)

    if to_update != [] do
      from(r in Organization, where: r.name in ^to_update)
      |> Repo.update_all(set: [billing_active: false])
    end
  end
end
