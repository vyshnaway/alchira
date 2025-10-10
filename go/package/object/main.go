package object

type T[K comparable, V any] struct {
	keys []K
	vals map[K]V
}

func New[K comparable, V any]() *T[K, V] {
	return &T[K, V]{
		keys: []K{},
		vals: make(map[K]V),
	}
}

func (m *T[K, V]) Keys() []K {
	return m.keys
}

func (m *T[K, V]) Values() []V {
	values := make([]V, len(m.keys))
	m.Range(func(k K, v V) {
		values = append(values, v)
	})
	return values
}

func (m *T[K, V]) Len() int {
	return len(m.keys)
}

func (m *T[K, V]) Get(key K) (V, bool) {
	val, ok := m.vals[key]
	return val, ok
}

func (m *T[K, V]) Set(key K, value V) {
	if _, exists := m.vals[key]; !exists {
		m.keys = append(m.keys, key)
	}
	m.vals[key] = value
}

func (m *T[K, V]) Delete(key K) {
	if _, exists := m.vals[key]; exists {
		delete(m.vals, key)
		for i, k := range m.keys {
			if k == key {
				m.keys = append(m.keys[:i], m.keys[i+1:]...)
				break
			}
		}
	}
}

func (m *T[K, V]) Range(function func(k K, v V)) {
	for _, key := range m.Keys() {
		if val, ok := m.Get(key); ok {
			function(key, val)
		}
	}
}

func (m *T[K, V]) ToMap() map[K]V {
	out := make(map[K]V, m.Len())
	for _, key := range m.Keys() {
		if val, ok := m.Get(key); ok {
			out[key] = val
		}
	}
	return out
}

func (m *T[K, V]) Sort(function func([]K) []K) {
	m.keys = function(m.keys)
}

func FromMap[K comparable, V any](source map[K]V) *T[K, V] {
	result := New[K, V]()
	for k, v := range source {
		result.Set(k, v)
	}
	return result
}

func FromArray[K comparable](source [][2]K) *T[K, K] {
	result := New[K, K]()
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
