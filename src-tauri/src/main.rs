#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use directories::ProjectDirs;
use once_cell::sync::Lazy;
use reqwest::{
    header::{HeaderMap, HeaderName},
    redirect::Policy,
    Client,
};
use reqwest_cookie_store::CookieStoreMutex;
use serde_json::{Map, Value};
use std::{sync::{Arc, Mutex}};
use std::path::PathBuf;

static COOKIE_DIR: Lazy<PathBuf> = Lazy::new(|| {
    let path = ProjectDirs::from("com", "GoForceX", "PreScore").unwrap();
    let path = path.data_dir();
    path.to_path_buf()
});

static COOKIE_PATH: Lazy<PathBuf> = Lazy::new(|| {
    let path = COOKIE_DIR.join("cookies.json");
    path
});

static COOKIE_STORE: Lazy<Arc<CookieStoreMutex>> = Lazy::new(|| {
    let read_file = std::fs::File::open(COOKIE_PATH.clone()).map(std::io::BufReader::new);
    let store = match read_file {
        Ok(file) => reqwest_cookie_store::CookieStore::load_json(file).unwrap(),
        Err(_) => {
            std::fs::create_dir_all(COOKIE_DIR.clone()).unwrap();
            let _file = std::fs::File::create(COOKIE_PATH.clone()).unwrap();

            let read_file = std::fs::File::open(COOKIE_PATH.clone())
                .map(std::io::BufReader::new)
                .unwrap();
            reqwest_cookie_store::CookieStore::load_json(read_file).unwrap()
        }
    };
    let store = reqwest_cookie_store::CookieStoreMutex::new(store);
    Arc::new(store)
});

static CLIENT: Lazy<Mutex<Client>> = Lazy::new(|| {
    let client_builder = reqwest::Client::builder();
    let mut headers = HeaderMap::new();
    let header_name = HeaderName::from_bytes(String::from("User-Agent").as_bytes()).unwrap();
    let header_value = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.124 Safari/537.36 Edg/102.0.1245.41".parse().unwrap();
    headers.insert(header_name, header_value);
    let client = client_builder
        .redirect(Policy::limited(5))
        .default_headers(headers)
        .cookie_store(true)
        .cookie_provider(Arc::clone(&COOKIE_STORE))
        .build()
        .unwrap();
    Mutex::new(client)
});

#[tauri::command]
async fn get_cookie(domain: String, path: String, name: String) -> Result<String, String> {
    let store = COOKIE_STORE.lock().unwrap();
    let cookie = store.get(&domain, &path, &name);
    match cookie {
        Some(cookie) => {
            return Ok(cookie.value().to_string());
        }
        None => {
            return Err("Cookie not found".to_string());
        }
    }
}

#[tauri::command]
async fn http_get_binary(
    mut url: String,
    headers_map: Option<Map<String, Value>>,
    query: Option<Map<String, Value>>,
) -> Result<Vec<u8>, String> {
    match query {
        Some(query_map) => {
            url.push_str("?");
            query_map.iter().for_each(|(key, value)| {
                let value_str = value.as_str().unwrap();
                url.push_str(&format!("{}={}&", key, value_str));
            });
            url.pop();
        }
        None => {}
    }

    let mut headers = HeaderMap::new();
    match headers_map {
        Some(headers_map) => {
            for (key, value) in headers_map {
                let header_name = HeaderName::from_bytes(key.as_bytes()).unwrap();
                let header_value = value.as_str().unwrap();
                headers.insert(header_name, header_value.parse().unwrap());
            }
        }
        None => {}
    }

    println!("{}", url);
    let request_builder = CLIENT.lock().unwrap().get(url);
    let body = request_builder.headers(headers).send().await;
    match body {
        Ok(response) => {
            let resp_result = response.bytes().await;

            let mut writer = std::fs::File::create(COOKIE_PATH.clone())
                .map(std::io::BufWriter::new)
                .unwrap();
            let store = COOKIE_STORE.lock().unwrap();
            store.save_json(&mut writer).unwrap();
            // for c in store.iter_any() {
            //     println!("{:?}", c);
            // }
            match resp_result {
                Ok(resp) => {
                    return Ok(resp.to_vec());
                }
                Err(err) => {
                    return Err(err.to_string());
                }
            }
        }
        Err(err) => {
            return Err(err.to_string());
        }
    }
}

#[tauri::command]
async fn http_get(
    url: String,
    headers_map: Option<Map<String, Value>>,
    query: Option<Map<String, Value>>,
) -> Result<String, String> {
    let resp: Result<Vec<u8>, String> = http_get_binary(url, headers_map, query).await;
    match resp {
        Ok(resp) => {
            return Ok(String::from_utf8(resp).unwrap());
        }
        Err(err) => {
            return Err(err);
        }
    }
}

#[tauri::command]
async fn http_post(
    url: String,
    headers_map: Option<Map<String, Value>>,
    form: Option<Map<String, Value>>,
    json: Option<Map<String, Value>>,
) -> Result<String, String> {
    if (form.is_some() && json.is_some()) || (form.is_none() && json.is_none()) {
        return Err("form and json can't be both None or both Some".to_string());
    }

    let mut headers = HeaderMap::new();
    match headers_map {
        Some(headers_map) => {
            for (key, value) in headers_map {
                let header_name = HeaderName::from_bytes(key.as_bytes()).unwrap();
                let header_value = value.as_str().unwrap();
                headers.insert(header_name, header_value.parse().unwrap());
            }
        }
        None => {}
    }

    let request_builder = CLIENT.lock().unwrap().post(url);
    if form.is_some() {
        let form_map = form.unwrap();
        let body = request_builder
            .headers(headers)
            .form(&form_map)
            .send()
            .await;
        match body {
            Ok(response) => {
                let resp_text_result = response.text().await;

                let mut writer = std::fs::File::create(COOKIE_PATH.clone())
                    .map(std::io::BufWriter::new)
                    .unwrap();
                let store = COOKIE_STORE.lock().unwrap();
                // for c in store.iter_any() {
                //     println!("{:?}", c);
                // }
                store.save_json(&mut writer).unwrap();

                match resp_text_result {
                    Ok(resp_text) => {
                        return Ok(resp_text);
                    }
                    Err(err) => {
                        return Err(err.to_string());
                    }
                }
            }
            Err(err) => {
                return Err(err.to_string());
            }
        }
    } else {
        let json_map = json.unwrap();
        let body = request_builder
            .headers(headers)
            .json(&json_map)
            .send()
            .await;
        match body {
            Ok(response) => {
                let resp_text_result = response.text().await;
                match resp_text_result {
                    Ok(resp_text) => {
                        return Ok(resp_text);
                    }
                    Err(err) => {
                        return Err(err.to_string());
                    }
                }
            }
            Err(err) => {
                return Err(err.to_string());
            }
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_cookie, http_get_binary, http_get, http_post])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
