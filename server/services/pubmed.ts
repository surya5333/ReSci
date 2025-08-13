interface PubMedPaper {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract?: string;
  doi?: string;
}

export async function searchPubMed(query: string, maxResults: number = 10): Promise<PubMedPaper[]> {
  try {
    // Search for paper IDs
    const searchUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
    const searchParams = new URLSearchParams({
      db: "pubmed",
      term: query,
      retmode: "json",
      retmax: maxResults.toString(),
      sort: "relevance"
    });

    const searchResponse = await fetch(`${searchUrl}?${searchParams}`);
    const searchData = await searchResponse.json();
    const pmids = searchData.esearchresult?.idlist || [];

    if (pmids.length === 0) {
      return [];
    }

    // Get paper details
    const summaryUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";
    const summaryParams = new URLSearchParams({
      db: "pubmed",
      id: pmids.join(","),
      retmode: "json"
    });

    const summaryResponse = await fetch(`${summaryUrl}?${summaryParams}`);
    const summaryData = await summaryResponse.json();

    const papers: PubMedPaper[] = [];
    
    for (const pmid of pmids) {
      const paperData = summaryData.result?.[pmid];
      if (paperData) {
        papers.push({
          pmid,
          title: paperData.title || "",
          authors: Array.isArray(paperData.authors) 
            ? paperData.authors.map((a: any) => a.name).join(", ")
            : paperData.authors || "",
          journal: paperData.fulljournalname || paperData.source || "",
          year: paperData.pubdate ? paperData.pubdate.split(" ")[0] : "",
          abstract: paperData.abstract || undefined,
          doi: paperData.elocationid || undefined
        });
      }
    }

    return papers;
  } catch (error) {
    console.error("PubMed search error:", error);
    return [];
  }
}

export async function getPubMedAbstract(pmid: string): Promise<string | null> {
  try {
    const url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";
    const params = new URLSearchParams({
      db: "pubmed",
      id: pmid,
      retmode: "xml"
    });

    const response = await fetch(`${url}?${params}`);
    const xmlText = await response.text();
    
    // Simple XML parsing to extract abstract
    const abstractMatch = xmlText.match(/<AbstractText[^>]*>(.*?)<\/AbstractText>/);
    return abstractMatch ? abstractMatch[1].replace(/<[^>]*>/g, '') : null;
  } catch (error) {
    console.error("Error fetching abstract:", error);
    return null;
  }
}
