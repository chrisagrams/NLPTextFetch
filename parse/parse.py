import argparse
from bs4 import BeautifulSoup

parser = argparse.ArgumentParser()
parser.add_argument("input_html")
parser.add_argument("--type", default="pmic")
args = parser.parse_args()

if __name__ == "__main__":
    with open(args.input_html, "r") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        print(soup.prettify())