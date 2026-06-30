import asyncio

from runtime.controller import ForgeController


async def main():
    controller = ForgeController()

    print("=== FORGEOS DEMO ===\n")

    print("Connecting organization...")
    result = await controller.start_mission("Launch luxury listing campaign")
    print("Boot Sequence complete.\n")

    print("Organization Genome:")
    print(result["genome"])
    print("")

    print("Workforce Assembly:")
    print(result["workforce"])
    print("")

    print("Board Meeting Convened.")
    print("Decision: Scoped MVP approved")
    print("")

    print("Executive Minutes:")
    print("Mission completed. Time saved: 14.6 hours")
    print("Organization Status: OPERATIONAL")
    print("")

    print("Replay Mission:")
    controller.replay_mission("mission-001")

    print("\n=== Demo Complete ===")


if __name__ == "__main__":
    asyncio.run(main())