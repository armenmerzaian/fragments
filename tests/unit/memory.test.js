// tests/unit/memory.test.js
// Armen Merzaian

const {
  listFragments,
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
} = require('../../src/model/data/memory');

describe('Memory data model', () => {
  let ownerId, fragmentId, fragment, fragmentData;

  // Set up some test data before each test
  beforeEach(() => {
    ownerId = 'testUser';
    fragmentId = '123';
    fragment = { ownerId, id: fragmentId, value: 'test fragment' };
    fragmentData = Buffer.from('test fragment');
  });

  // Test for writeFragment function
  test('writeFragment() should write fragment metadata to the database', async () => {
    // Write fragment metadata to the database
    await writeFragment(fragment);
    // Read back the fragment metadata to verify it was written
    const result = await readFragment(ownerId, fragmentId);
    expect(result).toEqual(fragment);
  });

  // Test for readFragment function
  test('readFragment() should read fragment metadata from the database', async () => {
    // Write fragment metadata to the database
    await writeFragment(fragment);
    // Read back the fragment metadata
    const result = await readFragment(ownerId, fragmentId);
    // Verify the read data matches the written data
    expect(result).toEqual(fragment);
  });

  // Test for writeFragmentData function
  test('writeFragmentData() should write fragment data to the database', async () => {
    // Write fragment data to the database
    await writeFragmentData(ownerId, fragmentId, fragmentData);
    // Read back the fragment data to verify it was written
    const result = await readFragmentData(ownerId, fragmentId);
    expect(result).toEqual(fragmentData);
  });

  // Test for readFragmentData function
  test('readFragmentData() should read fragment data from the database', async () => {
    // Write fragment data to the database
    await writeFragmentData(ownerId, fragmentId, fragmentData);
    // Read back the fragment data
    const result = await readFragmentData(ownerId, fragmentId);
    // Verify the read data matches the written data
    expect(result).toEqual(fragmentData);
  });

  // Test for listFragments function
  test('listFragments() should list fragment ids for the given user', async () => {
    // Write multiple fragments for the same user
    await writeFragment({ ownerId, id: '1234', value: 'test fragment 2' });
    await writeFragment({ ownerId, id: '12345', value: 'test fragment 3' });
    // List fragments for the user
    const result = await listFragments(ownerId);
    // Verify the fragment ids are listed correctly
    expect(result).toEqual(['123','1234', '12345']);
  });

  // Test for listFragments function returning an empty array
  test('listFragments() should return an empty array if no fragments are found', async () => {
    // List fragments for a user with no fragments
    const result = await listFragments('nonexistentUser');
    // Verify an empty array is returned
    expect(result).toEqual([]);
  });

  //Test for listFragments to return an expanded fragment
  test('listFragments() should return the expanded list of fragments is true', async () => {
    // Write multiple fragments for the same user
    await writeFragment({ ownerId, id: '1234', value: 'test fragment 2' });
    await writeFragment({ ownerId, id: '12345', value: 'test fragment 3' });

    const expanded = true;
    const result = await listFragments(ownerId, expanded);
    
    expect(result).toEqual([
      { ownerId, id: '123', value: 'test fragment' }, //from beforeEach()
      { ownerId, id: '1234', value: 'test fragment 2' },
      { ownerId, id: '12345', value: 'test fragment 3' },
    ]);
  });

  // Test for deleteFragment function
  test('deleteFragment() should delete fragment metadata and data from the database', async () => {
    // Write fragment metadata and data to the database
    await writeFragment(fragment);
    await writeFragmentData(ownerId, fragmentId, fragmentData);
    // Verify the fragment data is present before deletion
    expect(await readFragment(ownerId, fragmentId)).toEqual(fragment);
    expect(await readFragmentData(ownerId, fragmentId)).toEqual(fragmentData);
    // Delete the fragment
    await deleteFragment(ownerId, fragmentId);
    // Verify the fragment data is deleted
    expect(await readFragment(ownerId, fragmentId)).toBeUndefined();
    expect(await readFragmentData(ownerId, fragmentId)).toBeUndefined();
  });
});
