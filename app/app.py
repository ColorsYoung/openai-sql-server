import streamlit as st
import requests

st.title('ลูกรัก ai')

prompt = st.text_input('ถามหม่องนี้นะ')

if st.button('Submit'):
    if prompt:
        try:
            # ส่งคำถามไปยัง server.js
            response = requests.get('http://localhost:3000/query', params={'prompt': prompt})
            response.raise_for_status()
            data = response.json()

            if isinstance(data, list) and len(data) > 0:
                st.write('Result:')
                st.dataframe(data)
            else:
                st.write('No data found.')
        except requests.exceptions.RequestException as e:
            st.error(f"Error querying API: {e}")
    else:
        st.error('Please enter a prompt.')
