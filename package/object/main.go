package object

import "slices"

type T[K comparable, V any] struct {
	keys []K
	vals []V
}

func New[K comparable, V any](initial_size int) *T[K, V] {
	return &T[K, V]{
		keys: make([]K, 0, initial_size),
		vals: make([]V, 0, initial_size),
	}
}

func (m *T[K, V]) Keys() []K {
	return m.keys
}

func (m *T[K, V]) Values() []V {
	return m.vals
}

func (m *T[K, V]) Len() int {
	return len(m.keys)
}

func (m *T[K, V]) Get(key K) (*V, bool) {
	if index := slices.Index(m.keys, key); index > -1 {
		return &m.vals[index], true
	}
	return nil, false
}

func (m *T[K, V]) Set(key K, value V) {

	if len(m.keys) == cap(m.keys) {
		newCap := cap(m.keys) * 2
		newKeys := make([]K, len(m.keys), newCap)
		newVals := make([]V, len(m.vals), newCap)
		copy(newKeys, m.keys)
		copy(newVals, m.vals)
		m.keys = newKeys
		m.vals = newVals
	}

	if index := slices.Index(m.keys, key); index > -1 {
		m.vals[index] = value
	} else {
		m.keys = append(m.keys, key)
		m.vals = append(m.vals, value)
	}
}

func (m *T[K, V]) Delete(key K) {
	for i, k := range m.keys {
		if k == key {
			m.keys = append(m.keys[:i], m.keys[i+1:]...)
			m.vals = append(m.vals[:i], m.vals[i+1:]...)
			break
		}
	}
}

func (m *T[K, V]) Range(function func(k K, v V)) {
	for index, key := range m.Keys() {
		function(key, m.vals[index])
	}
}

func (m *T[K, V]) ToMap() map[K]V {
	out := make(map[K]V, m.Len())
	for index, key := range m.Keys() {
		out[key] = m.vals[index]
	}
	return out
}

func FromUnorderedMap[K comparable, V any](source map[K]V) *T[K, V] {
	result := New[K, V](len(source))
	for k, v := range source {
		result.Set(k, v)
	}
	return result
}

func FromOrderedArray[K comparable](source [][2]K) *T[K, K] {
	result := New[K, K](len(source))
	for _, kv := range source {
		result.Set(kv[0], kv[1])
	}
	return result
}

func (m *T[K, V]) Copy(source *T[K, V]) {
	source.Range(func(k K, v V) {
		m.Set(k, v)
	})
}

func (m *T[K, V]) Sort(function func([]K) []K) {
	m.keys = function(m.keys)
}
