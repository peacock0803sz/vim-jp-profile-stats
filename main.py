import os
from collections.abc import Iterable

import gspread
import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st

SITE_TITLE = "vim-jp 使用環境の統計ダッシュボード"
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")


@st.cache_resource()
def get_auth():
    return gspread.api_key(GOOGLE_API_KEY)


@st.cache_data()
def get_sheet_df(file_id: str):
    gc = get_auth()
    file = gc.open_by_key(file_id)
    ws_input = file.worksheet("入力")

    data = ws_input.get_all_values(range_name="A2:Z")
    df = pd.DataFrame(data)
    df.columns = df.iloc[0]
    return df[1:]


st.set_page_config(layout="wide", page_title=SITE_TITLE, page_icon="📊")
st.title(SITE_TITLE)
df = get_sheet_df("1o9bzmYKO0cKI3GQWSJePM_GrfnJRPGW3FdmyVLeP1JY")
cols: Iterable[str] = df.columns[1:]

col_selected = st.selectbox("項目名", cols, index=0)
selected: pd.Series = df[col_selected]
grouped = selected.value_counts().rename({"": np.nan}).sort_index(na_position="last")

tab_data, tab_chart = st.tabs(["データ", "グラフ"])
tab_data.dataframe(grouped)
fig = px.pie(grouped, names=grouped.index, values=grouped.values)
tab_chart.plotly_chart(fig)
