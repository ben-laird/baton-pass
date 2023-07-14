mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

// Example functions

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

#[wasm_bindgen]
pub fn add_rs(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen]
pub fn subtract_rs(a: i32, b: i32) -> i32 {
    a - b
}

#[wasm_bindgen]
pub fn wish_happy_birthday(name: String, age: i32) -> String {
    String::from(&format!("Happy {}th birthday, {}!", age, name))
}
