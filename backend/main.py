from fastapi import FastAPI

import os
import pinecone as pinecone_lib
import chromadb

app = FastAPI()

VECTOR_DB = os.environ.get("VECTOR_DB", "chroma")  # Default to Chroma

if VECTOR_DB == "pinecone":
    # Initialize Pinecone
    PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
    PINECONE_ENVIRONMENT = os.environ.get("PINECONE_ENVIRONMENT")
    pc = pinecone_lib.Pinecone(api_key=PINECONE_API_KEY)
    index_name = "propilot-index"  # Replace with your index name
    if index_name not in pc.list_indexes().names:
        pc.create_index(name=index_name, dimension=1536, metric="cosine")  # Adjust dimension as needed
    index = pc.Index(index_name)
    vector_db = index
elif VECTOR_DB == "chroma":
    # Initialize ChromaDB
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    vector_db = chroma_client
else:
    raise ValueError("Invalid VECTOR_DB environment variable. Must be 'pinecone' or 'chroma'.")

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# Replace with your Auth0 domain and API identifier
AUTH0_DOMAIN = os.environ.get("AUTH0_DOMAIN", "your_auth0_domain")
API_IDENTIFIER = os.environ.get("API_IDENTIFIER", "your_api_identifier")

async def get_token_auth_header(
    auth: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Obtains the Access Token from the Authorization Header
    """
    token = auth.credentials
    return token

async def verify_jwt(token: str = Depends(get_token_auth_header)):
    """
    Verifies the JWT and returns the payload
    """
    # This is a placeholder. In a real application, you would
    # verify the JWT using the Auth0 library and check the claims.
    # For example:
    # try:
    #     payload = jwt.decode(
    #         token,
    #         AUTH0_PUBLIC_KEY,
    #         algorithms=["RS256"],
    #         audience=API_IDENTIFIER,
    #         issuer=f"https://{AUTH0_DOMAIN}/"
    #     )
    #     return payload
    # except Exception as e:
    #     raise HTTPException(status_code=401, detail="Invalid token")
    return {"sub": "user123"}  # Dummy payload

from fastapi import WebSocket

@app.get("/")
async def root(payload: dict = Depends(verify_jwt)):
    return {"message": f"Hello from FastAPI! Using vector DB: {VECTOR_DB}", "user": payload}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")