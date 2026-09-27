#!/usr/bin/env python3
import sys
import os
import json
import math

os.makedirs("data", exist_ok=True)
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.core.database import SessionLocal, Base, engine
from app.models.domain import Standard
from seed import seed_baseline_data
from app.services.retrieval.hybrid import get_hybrid_candidates

BENCHMARK_QUERIES = [
    {"query": "Procurement of 500 outdoor LED streetlight luminaires for municipal roads", "expected_is": "IS 10322"},
    {"query": "Industrial safety helmets for high-risk construction sites shock absorption", "expected_is": "IS 2925"},
    {"query": "High strength deformed steel reinforcement bars Fe 500D for bridges", "expected_is": "IS 1786"},
    {"query": "Ergonomic executive work chairs with metal base and lumbar support", "expected_is": "IS 17631"},
    {"query": "Protective helmets for two-wheeler motorcyclists chin strap testing", "expected_is": "IS 4151"},
    {"query": "Solid state lighting LED photometric measurement efficacy testing", "expected_is": "IS 16106"}
]

def calculate_mrr(ranks):
    return sum(1.0 / r for r in ranks if r > 0) / max(len(ranks), 1)

def calculate_ndcg(ranks, k=10):
    if not ranks:
        return 0.0
    query_ndcgs = []
    for r in ranks:
        if 0 < r <= k:
            dcg = 1.0 / math.log2(r + 1)
        else:
            dcg = 0.0
        idcg = 1.0 # single ground truth target per query (1.0 / log2(2) = 1.0)
        query_ndcgs.append(dcg / idcg)
    return sum(query_ndcgs) / len(query_ndcgs)

def main():
    print("\n==========================================")
    print("📊 MANAK RETRIEVAL BENCHMARK EVALUATION")
    print("==========================================")
    
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_baseline_data(db)
    total_stds = db.query(Standard).count()
    print(f"Corpus Standards:  {total_stds}")
    print(f"Benchmark Queries: {len(BENCHMARK_QUERIES)}")
    print("------------------------------------------")

    recall_1 = 0
    recall_5 = 0
    recall_10 = 0
    ranks = []

    for idx, bq in enumerate(BENCHMARK_QUERIES, start=1):
        q = bq["query"]
        target = bq["expected_is"].upper()
        candidates = get_hybrid_candidates(q, db, top_k_lexical=20, top_k_dense=20)
        
        found_rank = 0
        for r_idx, c in enumerate(candidates[:10], start=1):
            if target.replace(" ", "") in c["standard_number"].upper().replace(" ", ""):
                found_rank = r_idx
                break
        
        ranks.append(found_rank)
        if found_rank == 1:
            recall_1 += 1
        if 0 < found_rank <= 5:
            recall_5 += 1
        if 0 < found_rank <= 10:
            recall_10 += 1

        rank_str = f"Rank #{found_rank}" if found_rank > 0 else "Not in Top 10"
        print(f"Q{idx}: {q[:50]}... ➔ {rank_str}")

    n_q = len(BENCHMARK_QUERIES)
    r1_val = round(recall_1 / n_q, 3)
    r5_val = round(recall_5 / n_q, 3)
    r10_val = round(recall_10 / n_q, 3)
    mrr_val = round(calculate_mrr(ranks), 3)
    ndcg_val = round(calculate_ndcg(ranks), 3)

    print("\n==========================================")
    print("📈 FINAL MEASURED RETRIEVAL METRICS")
    print("==========================================")
    print(f"Recall@1:   {r1_val}")
    print(f"Recall@5:   {r5_val}")
    print(f"Recall@10:  {r10_val} (Target: >= 0.92)")
    print(f"MRR:        {mrr_val} (Target: >= 0.80)")
    print(f"nDCG@10:    {ndcg_val}")
    print("==========================================\n")

    db.close()

if __name__ == "__main__":
    main()
