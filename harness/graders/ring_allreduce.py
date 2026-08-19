"""Grade: ring all-reduce from scratch (CPU, gloo — no GPU fleet needed).

Contract — harness/solutions/ring_allreduce.py:

    def ring_allreduce(tensor, rank: int, world_size: int) -> Tensor:
        '''Sum-all-reduce `tensor` across ranks using ONLY point-to-point
        torch.distributed.send / recv (or isend/irecv) in a ring:
        reduce-scatter phase (world_size - 1 steps) then all-gather phase
        (world_size - 1 steps), each rank talking only to its neighbors.
        Return the reduced tensor (every rank ends with the full sum).
        Calling dist.all_reduce / all_gather / reduce / broadcast fails you.'''

Graded across 4 CPU processes on correctness vs the true sum and on actually
using point-to-point ops (collectives are monkeypatched to raise).
"""

import os
import tempfile

import torch
import torch.distributed as dist
import torch.multiprocessing as mp

from .common import check, load_solution

WORLD = 4
NUMEL = 4096


def _worker(rank, init_file, results):
    dist.init_process_group(
        "gloo", init_method=f"file://{init_file}", rank=rank, world_size=WORLD
    )
    try:
        # Forbid the shortcut collectives.
        def banned(*_a, **_k):
            raise RuntimeError("collective ops are banned — build the ring from send/recv")

        for name in ("all_reduce", "all_gather", "reduce", "broadcast", "all_gather_into_tensor", "reduce_scatter"):
            setattr(dist, name, banned)

        from solutions.ring_allreduce import ring_allreduce

        g = torch.Generator().manual_seed(100 + rank)
        local = torch.randn(NUMEL, generator=g)
        expected = torch.zeros(NUMEL)
        for r in range(WORLD):
            expected += torch.randn(NUMEL, generator=torch.Generator().manual_seed(100 + r))

        out = ring_allreduce(local.clone(), rank, WORLD)
        err = (out - expected).abs().max().item()
        results[rank] = ("ok", err)
    except Exception as e:
        results[rank] = ("error", f"{type(e).__name__}: {e}")
    finally:
        dist.destroy_process_group()


def grade():
    checks, metrics = [], {}
    fn, found = load_solution("ring_allreduce", "ring_allreduce")
    checks.append(found)
    if fn is None:
        return checks, metrics

    os.environ.setdefault("GLOO_SOCKET_IFNAME", "lo")
    with tempfile.TemporaryDirectory() as td:
        init_file = os.path.join(td, "init")
        manager = mp.Manager()
        results = manager.dict()
        ctx = mp.spawn(_worker, args=(init_file, results), nprocs=WORLD, join=True)
        del ctx

    max_err = 0.0
    for rank in range(WORLD):
        status, payload = results.get(rank, ("error", "rank never reported"))
        if status == "ok":
            max_err = max(max_err, float(payload))
            checks.append(check(f"rank-{rank}", float(payload) <= 1e-4, f"max abs error vs true sum: {float(payload):.2e}"))
        else:
            checks.append(check(f"rank-{rank}", False, str(payload)))

    metrics["max_abs_err"] = max_err
    metrics["world_size"] = WORLD
    return checks, metrics
