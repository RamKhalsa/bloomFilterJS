const { murmurHash } = require('./hashes/murmur');
const simpleHash = require('./hashes/simple');
const fnv32a = require('./hashes/fnv');

const BloomFilter = function(size, numHashes) {
    this._storage = new Array(size).fill(0);
    this.size = size;
    this.numHashes = numHashes;
    this.numAdded = 0;
}

const hash = function(string, max, hasher, seed) {
    const num = hasher(string, max, seed);
    return num > max ? num % max : num;
}

BloomFilter.prototype = {
    addToFilter : function(string) {
        this.numAdded++;
        const indices = this.getHashes(string);
        for (let i = 0; i < indices.length; i++) {
            this._storage[indices[i]] = 1;
        }
    },
    _hashes: [murmurHash, simpleHash, fnv32a],
    mightContain: function(string){
        const indices = this.getHashes(string);
        for (let i = 0; i < indices.length; i++) {
            if (this._storage[indices[i]] === 0) {
                return false;
            }
        }
        return true;
    },
    getHashes:function(string) {
        var indices = [];
        for (var i = 0; i < this.numHashes; i++) {
            indices.push(hash(string, this.size, this._hashes[i], i));
        }
        return indices;
    },
    getFalsePositiveRate:function() {
        var eExp = ((-1) * this.numHashes * this.numAdded) / this.size;
        return Math.pow((1 - Math.pow(Math.E, (eExp))), this.numHashes).toFixed(2);
    }
}

module.exports = BloomFilter;
