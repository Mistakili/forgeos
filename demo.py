import asyncio
import json

from dotenv import load_dotenv
from rich.console import Console

load_dotenv()
from rich.panel import Panel
from rich.table import Table

from runtime.controller import ForgeController

console = Console()


async def main():
    controller = ForgeController()

    console.print(Panel.fit("FORGEOS DEMO", style="bold cyan"))

    console.print("\n[bold]Phase 1:[/] Boot Sequence — collecting evidence...")
    result = await controller.start_mission("Launch luxury listing campaign")
    console.print("[green]Boot Sequence complete.[/]\n")

    console.print("[bold]Phase 2:[/] Organization Genome")
    genome = result["genome"]
    console.print(
        Panel(
            json.dumps(genome, indent=2),
            title="Genome",
            border_style="blue",
        )
    )

    console.print("\n[bold]Phase 3:[/] Workforce Assembly")
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Role")
    table.add_column("Status")
    for role in result["workforce"]["roles"]:
        table.add_row(role["name"], role["status"])
    console.print(table)

    console.print("\n[bold]Phase 4:[/] Board Meeting")
    decision = result["board_decision"]
    console.print(f"Decision: [cyan]{decision.get('decision')}[/]")
    console.print(f"Rationale: {decision.get('rationale')}")

    console.print("\n[bold]Phase 5:[/] Executive Minutes")
    console.print(f"Mission completed. Time saved: {result['time_saved_hours']} hours")
    mode = result["reasoning_mode"]
    provider = result.get("reasoning_provider")
    label = f"{mode}" + (f" ({provider})" if provider else "")
    console.print(f"Reasoning: {label}")
    console.print(f"Organization Status: [green]{result['status']}[/]")

    console.print("\n[bold]Pipeline trace:[/]")
    pipeline = result["pipeline"]
    console.print(
        f"  Evidence: {pipeline['evidence_count']} → "
        f"Facts: {pipeline['facts_count']} → "
        f"Claims: {pipeline['claims_count']} → Genome"
    )

    console.print("\n[bold]Replay Mission:[/]")
    controller.replay_mission(result["mission_id"])

    console.print("\n[dim]Start the UI: cd ui && npm install && npm run dev[/]")
    console.print("[dim]Start the API: python -m api.server[/]")


if __name__ == "__main__":
    asyncio.run(main())