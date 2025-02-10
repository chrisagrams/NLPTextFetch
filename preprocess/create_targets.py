import re
import json
import pandas as pd

regex_patterns = {
    "pmic": re.compile(r"^10\.1002/pmic\."),
    "jprot": re.compile(r"^10\.1016/j\.jprot\."),
    "pr": re.compile(r"^10\.1021/pr"),
    "analchem": re.compile(r"^10\.1021/acs\.analchem\."),
}

if __name__ == "__main__":
    df = pd.read_csv("pubmed_ids_cleaned_w_pmcid_w_doi.csv")
    df = df.dropna(subset=["dois"])
    df = df[df["pmcids"].isna()]

    doi_categories = {"pmic": [], "jprot": [], "pr": [], "analchem": []}

    for doi_str in df["dois"]:
        doi_list = doi_str.split(",")
        for doi in doi_list:
            doi = doi.strip()
            if not doi:
                continue
            for category, pattern in regex_patterns.items():
                if pattern.search(doi):
                    doi_categories[category].append(doi)
                    break

    with open("targets.json", "w") as json_file:
        json.dump(doi_categories, json_file, indent=4)
