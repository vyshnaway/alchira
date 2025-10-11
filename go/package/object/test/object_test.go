package test

import (
	"main/package/console"
	O "main/package/object"
	"reflect"
	"testing"
)

func TestSetAndGet(t *testing.T) {
    m := O.New[string, int]()
    m.Set("a", 1)
    m.Set("b", 2)
    m.Set("b", 3)
    m.Set("", 3)
    m.Set("", 3)
    console.Render.Raw(m.Keys())

    // if val, ok := m.Get("a"); !ok || val != 1 {
    //     t.Errorf("expected 1 for key 'a', got %v, ok=%v", val, ok)
    // }
    // if val, ok := m.Get("b"); !ok || val != 2 {
    //     t.Errorf("expected 2 for key 'b', got %v, ok=%v", val, ok)
    // }
    // if _, ok := m.Get("c"); ok {
    //     t.Errorf("expected key 'c' to be missing")
    // }
}

func TestKeysOrder(t *testing.T) {
    m := O.New[int, string]()
    m.Set(10, "ten")
    m.Set(5, "five")
    m.Set(8, "eight")
    expected := []int{10, 5, 8}
    got := m.Keys()
    if !reflect.DeepEqual(got, expected) {
        t.Errorf("expected keys %v, got %v", expected, got)
    }
}

func TestDelete(t *testing.T) {
    m := O.New[string, int]()
    m.Set("x", 100)
    m.Set("y", 200)
    m.Delete("x")
    if _, ok := m.Get("x"); ok {
        t.Errorf("expected key 'x' to be deleted")
    }
    expected := []string{"y"}
    if !reflect.DeepEqual(m.Keys(), expected) {
        t.Errorf("expected keys %v, got %v", expected, m.Keys())
    }
}

func TestRange(t *testing.T) {
    m := O.New[int, string]()
    m.Set(1, "one")
    m.Set(2, "two")
    m.Set(2, "two")
    out := map[int]string{}
    m.Range(func(k int, v string) {
        out[k] = v
    })
    if !reflect.DeepEqual(out, map[int]string{1: "one", 2: "two"}) {
        t.Errorf("expected map values %v, got %v", map[int]string{1: "one", 2: "two"}, out)
    }
}
