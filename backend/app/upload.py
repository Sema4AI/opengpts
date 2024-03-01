"""API to deal with file uploads via a runnable.

For now this code assumes that the content is a base64 encoded string.

The details here might change in the future.

For the time being, upload and ingestion are coupled
"""
from __future__ import annotations
from functools import lru_cache

import os
from typing import Any, BinaryIO, List, Optional

from langchain.text_splitter import RecursiveCharacterTextSplitter, TextSplitter
from langchain_community.document_loaders.blob_loaders import Blob
from langchain_community.vectorstores.redis import Redis
from langchain_core.runnables import (
    ConfigurableField,
    RunnableConfig,
    RunnableSerializable,
)
from langchain_core.vectorstores import VectorStore
from langchain_openai import OpenAIEmbeddings

from app.ingest import ingest_blob
from app.parsing import MIMETYPE_BASED_PARSER


def _guess_mimetype(file_bytes: bytes) -> str:
    """Guess the mime-type of a file."""
    try:
        import magic
    except ImportError as e:
        raise ImportError(
            "magic package not found, please install it with `pip install python-magic`"
        ) from e

    mime = magic.Magic(mime=True)
    mime_type = mime.from_buffer(file_bytes)
    return mime_type


def _convert_ingestion_input_to_blob(data: BinaryIO) -> Blob:
    """Convert ingestion input to blob."""
    file_data = data.read()
    mimetype = _guess_mimetype(file_data)
    file_name = data.name
    return Blob.from_data(
        data=file_data,
        path=file_name,
        mime_type=mimetype,
    )


class IngestRunnable(RunnableSerializable[BinaryIO, List[str]]):
    """Runnable for ingesting files into a vectorstore."""

    text_splitter: TextSplitter
    """Text splitter to use for splitting the text into chunks."""
    assistant_id: Optional[str]
    """Ingested documents will be associated with this assistant id.
    """

    class Config:
        arbitrary_types_allowed = True

    @property
    def vectorstore(self) -> VectorStore:
        """Vectorstore to ingest into."""
        if self.assistant_id is None:
            raise ValueError("assistant_id must be provided")
        return get_vectorstore(self.assistant_id)

    def invoke(
        self, input: BinaryIO, config: Optional[RunnableConfig] = None
    ) -> List[str]:
        return self.batch([input], config)

    def batch(
        self,
        inputs: List[BinaryIO],
        config: RunnableConfig | List[RunnableConfig] | None = None,
        *,
        return_exceptions: bool = False,
        **kwargs: Any | None,
    ) -> List:
        """Ingest a batch of files into the vectorstore."""
        ids = []
        for data in inputs:
            blob = _convert_ingestion_input_to_blob(data)
            ids.extend(
                ingest_blob(
                    blob,
                    MIMETYPE_BASED_PARSER,
                    self.text_splitter,
                    self.vectorstore,
                )
            )
        return ids


@lru_cache(maxsize=1)
def get_vectorstore(assistant_id: str) -> VectorStore:
    return Redis(
        redis_url=os.environ["REDIS_URL"],
        index_name=assistant_id,
        embedding=OpenAIEmbeddings(),
    )


ingest_runnable = IngestRunnable(
    text_splitter=RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200),
).configurable_fields(
    assistant_id=ConfigurableField(
        id="assistant_id",
        annotation=str,
        name="Assistant ID",
    ),
)
