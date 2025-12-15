package object

import "slices"

type T[K comparable, V any] struct {
	Keys []K
	Vals []V
}

func New[K comparable, V any](initial_size int) *T[K, V] {
	return &T[K, V]{
		Keys: make([]K, 0, initial_size),
		Vals: make([]V, 0, initial_size),
	}
}

func (m *T[K, V]) GetKeys() []K {
	return m.Keys
}

func (m *T[K, V]) GetVals() []V {
	return m.Vals
}

func (m *T[K, V]) Len() int {
	return len(m.Keys)
}

func (m *T[K, V]) Get(key K) (*V, bool) {
	if index := slices.Index(m.Keys, key); index > -1 {
		return &m.Vals[index], true
	}
	return nil, false
}

func (m *T[K, V]) Set(key K, value V) {

	if len(m.Keys) == cap(m.Keys) {
		newCap := cap(m.Keys) * 2
		newKeys := make([]K, len(m.Keys), newCap)
		newVals := make([]V, len(m.Vals), newCap)
		copy(newKeys, m.Keys)
		copy(newVals, m.Vals)
		m.Keys = newKeys
		m.Vals = newVals
	}

	if index := slices.Index(m.Keys, key); index > -1 {
		m.Vals[index] = value
	} else {
		m.Keys = append(m.Keys, key)
		m.Vals = append(m.Vals, value)
	}
}

func (m *T[K, V]) Delete(key K) {
	for i, k := range m.Keys {
		if k == key {
			m.Keys = append(m.Keys[:i], m.Keys[i+1:]...)
			m.Vals = append(m.Vals[:i], m.Vals[i+1:]...)
			break
		}
	}
}

func (m *T[K, V]) Range(function func(k K, v V)) {
	for index, key := range m.GetKeys() {
		function(key, m.Vals[index])
	}
}

func (m *T[K, V]) ToMap() map[K]V {
	out := make(map[K]V, m.Len())
	for index, key := range m.GetKeys() {
		out[key] = m.Vals[index]
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
	keymap := make(map[K]V, m.Len())
	for i := range m.Len() {
		keymap[m.Keys[i]] = m.Vals[i]
	}
	m.Keys = function(m.Keys)
	m.Vals = make([]V, 0, len(m.Keys))
	for _, k := range m.Keys {
		m.Vals = append(m.Vals, keymap[k])
	}
}
