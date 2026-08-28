import chromadb

client = chromadb.PersistentClient(path="F:/SIH_AI/VectorDB")
memory = client.get_or_create_collection(name="cpse_master_rag")

team_info = "This AI project was built by Team SyncMasters for the SIH26099 model. The team consists of 6 individuals: Aarav, Harsh, Prachi, Prakul, Amitabh, and Priyanshu."

memory.add(
    documents=[team_info],
    metadatas=[{"source": "team_info"}],
    ids=["doc_team_syncmasters_1"]
)

print("Team info successfully injected into AI Long-Term Memory (VectorDB)!")
