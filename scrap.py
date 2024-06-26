import requests
import os

# Fungsi untuk mengunduh gambar dari URL
def download_image(url, directory):
    # Lakukan permintaan HTTP GET untuk mengunduh gambar
    response = requests.get(url)
    
    # Periksa apakah permintaan berhasil (kode status 200)
    if response.status_code == 200:
        # Ekstrak nama file dari URL
        filename = os.path.join(directory, url.split('/')[-1])
        
        # Simpan gambar ke file lokal
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"Gambar {url} berhasil diunduh sebagai {filename}")
    else:
        print(f"Error: Gagal mengunduh gambar {url}, kode status {response.status_code}")

# URL dasar tempat gambar disimpan
base_url = 'https://blabla.com/assets/img/user/user-'
# Direktori tempat menyimpan gambar
download_dir = 'downloaded_images'

# Loop untuk mengunduh gambar
i = 1
while True:
    url = f"{base_url}{i}.jpg" #Sesuaikan ekstensi file, disini ingin mendownload file dengan ekstensi jpg
    if not download_image(url, download_dir):
        break  # Keluar dari loop jika gambar tidak ditemukan
    i += 1
